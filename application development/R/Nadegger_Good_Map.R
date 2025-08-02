generate_rainfall_map <- function(month_index = 1) {
  # load all the required packages
  library(geodata) # i used this to get the data (worldclim)
  library(terra) # i used this to crop the rainfall raster to the africa shp
  library(sf) # used variously (validating geometry, for bb manipulation)
  library(ggplot2) # i used this for plotting
  library(rnaturalearth) # i used this to get the shp of africa
  library(patchwork) # i used this to combine the 2 maps into 1 layout
  library(tidyverse) # i used this for the filtering
  
  # get the climate data from worldclim
  precipitation <- worldclim_global(var = "prec",
                                    res = 10,
                                    path = tempdir())
  
  # get the shapefile of africa from natural earth
  africa_shp <- ne_countries(continent = "Africa", returnclass = "sf") |>
    st_make_valid()
  
  # disable s2 geometry engine to avoid errors with invalid geometries
  sf_use_s2(FALSE)
  
  # define bounding box for southern and central africa + madagascar
  bbox <- st_bbox(c(
    xmin = 10,
    xmax = 50,
    ymin = -30,
    ymax = 0
  ), crs = st_crs(africa_shp))
  
  # define color gradient for rainfall
  colors_rain <- scale_fill_gradientn(
    colors = c("red", "orange", "coral", "lightblue", "deepskyblue", "blue"),
    name = "Rainfall (mm)"
  )
  
  # function to generate the full + zoomed map for a given month (index)
  generate_map <- function(month_index) {
    # extract the raster layer for the given month (index; 1-12 = jan-dec)
    rain_month <- precipitation[[month_index]]
    
    # crop the rainfall raster to africa
    rain_month_africa <- crop(rain_month, vect(africa_shp))
    
    # convert raster to dataframe so ggplot can work with it
    rain_df <- as.data.frame(rain_month_africa, xy = TRUE, na.rm = TRUE)
    colnames(rain_df) <- c("lon", "lat", "rain")
    
    # filter the rainfall data to this zoomed region (using dplyr)
    rain_df_zoomed <- rain_df %>%
      filter(lon >= bbox["xmin"], lon <= bbox["xmax"], lat >= bbox["ymin"], lat <= bbox["ymax"])
    
    # crop the africa shapefile to the same region
    africa_zoomed <- africa_shp |>
      st_crop(bbox)
    
    # create the full africa map
    map_africa <- ggplot() +
      
      # add the rainfall raster as background
      geom_raster(data = rain_df, aes(x = lon, y = lat, fill = rain)) +
      
      # apply the color scale for rainfall
      colors_rain +
      
      # add country borders with a subtle white outline
      geom_sf(
        data = africa_shp,
        fill = NA,
        color = "black",
        size = 0.4
      ) +
      
      # basic labels for axes and title
      labs(title = "Full Africa", x = "Longitude", y = "Latitude") +
      
      # apply a minimal theme with some styling overrides
      theme(
        plot.title = element_text(size = 16, face = "bold"),
        plot.background = element_rect(fill = "linen", color = NA),
        panel.background = element_rect(fill = "linen", color = NA),
        panel.grid.major = element_line(color = "grey", size = 0.3),
        axis.title = element_text(size = 9),
        axis.text = element_text(size = 9),
        legend.position = "none"  # hide legend for this overview panel
      )
    
    # create the zoomed panel
    map_detailed <- ggplot() +
      
      # use the filtered raster data for southern/central africa
      geom_raster(data = rain_df_zoomed, aes(x = lon, y = lat, fill = rain)) +
      
      # apply the same rainfall color scale
      colors_rain +
      
      # draw borders again for the zoomed region
      geom_sf(
        data = africa_zoomed,
        fill = NA,
        color = "black",
        size = 0.4
      ) +
      
      # labels for title and axes
      labs(title = "Southern/Central Africa, including Madagascar", x = "Longitude", y = "Latitude") +
      
      # set manual limits for the zoom box
      coord_sf(xlim = c(10, 55),
               ylim = c(-30, 0),
               expand = FALSE) +
      
      # use the same styling but keep the legend this time
      theme(
        plot.title = element_text(size = 16, face = "bold"),
        plot.background = element_rect(fill = "linen", color = NA),
        panel.background = element_rect(fill = "linen", color = NA),
        panel.grid.major = element_line(color = "grey", size = 0.3),
        axis.title = element_text(size = 10),
        axis.text = element_text(size = 9),
        legend.background = element_rect(fill = "linen", color = NA),
        legend.key = element_rect(fill = "linen", color = NA),
        legend.title = element_text(size = 10),
        legend.text = element_text(size = 9),
        legend.position = "right" # show the legend this time
      )
    
    # combine both maps into a layout
    map_final <- map_africa + map_detailed +
      plot_annotation(
        title = paste0("Africa's rainfall in ", month.abb[month_index], " (1970–2000)"),
        subtitle = "With a focus on Southern/Central Africa, including Madagascar",
        caption = "Source: WorldClim",
        theme = theme(
          plot.title = element_text(size = 18, face = "bold"),
          plot.subtitle = element_text(size = 12),
          plot.caption = element_text(size = 9),
          plot.background = element_rect(fill = "linen", color = NA)
        )
      )
    
    # return the combined layout
    return(map_final)
  }
  
  plot(generate_map(month_index))
}

generate_rainfall_map(2)


### as to a small description;
# i did a little bit more here:
# -> i fetched the rainfall data and africa shapefile (also had to disable s2)
# -> then i defined a bounding box for a region i actually wanted to zoom in on which is southern + central africa, plus madagascar, because after looking at the data these were the areas with actual rain
# -> i created a custom color scale that looks more like an actual rainfall gradient
# -> i wrote a function that builds two maps at once: one full overview of africa and one zoomed-in map
# -> the rainfall data gets cropped and filtered differently for each panel – the full map hides the legend because we only need 1 legend and it will be shown for the zoomed map
# -> country borders were given a rather normal, visible color (black) this time
# -> both maps were then stitched together using patchwork, so it feels more like a dashboard
# -> i kept the styling simple – beige background, some grid lines and no agressive coloring